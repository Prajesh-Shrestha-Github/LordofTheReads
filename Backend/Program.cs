using LordofTheReads.Database;
using LordofTheReads.Middlewares;
using LordofTheReads.Services;
using LordofTheReads.Settings;
using LordofTheReads.Hubs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Npgsql.EntityFrameworkCore.PostgreSQL.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Add CORS policy to allow frontend to communicate with backend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithExposedHeaders("WWW-Authenticate");
    });
});

// Configure JSON serialization to handle circular references
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with explicit OpenAPI version
builder.Services.AddSwaggerGen(options => 
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "Lord of The Reads API",
        Description = "API for the Lord of The Reads book store application"
    });
    
    // Force the OpenAPI specification version to 3.0.0
    options.DocInclusionPredicate((docName, apiDesc) => true);
    
    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure JWT Authentication
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JWT"));
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<AdminAuthorizationService>();

// Configure Authentication
builder.Services.AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                builder.Configuration["JWT:Key"] ?? throw new InvalidOperationException("JWT:Key is not configured"))),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JWT:Issuer"] ?? throw new InvalidOperationException("JWT:Issuer is not configured"),
            ValidateAudience = true,
            ValidAudience = builder.Configuration["JWT:Audience"] ?? throw new InvalidOperationException("JWT:Audience is not configured"),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("PostgresConnection"),
        npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "public")
    ).LogTo(Console.WriteLine);
});
// Notification hub and SignalR are already covered by the AllowFrontend CORS policy

builder.Services.AddScoped<IBookService, BookService>();
// Register cart service
builder.Services.AddScoped<ICartService, CartService>();
// Register bookmark service
builder.Services.AddScoped<IBookmarkService, BookmarkService>();
// Register order service
builder.Services.AddScoped<IOrderService, OrderService>();
// Register notification service and SignalR
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Use our custom middleware to fix the OpenAPI version in swagger.json
    app.UseSwaggerVersionMiddleware();
    
    // Configure Swagger
    app.UseSwagger();
    
    app.UseSwaggerUI(c => {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Lord of The Reads API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

// Use Routing
app.UseRouting();

// Use Authentication and Authorization
app.UseAuthentication();
app.UseAuthorization();

// Configure endpoints
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<NotificationHub>("/hubs/notification");
});

// Create and apply migrations, then seed the database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("Database");
    var context = services.GetRequiredService<AppDbContext>();
    try
    {
        // Apply pending EF Core migrations
        logger.LogInformation("Applying database migrations...");
        context.Database.Migrate();
        logger.LogInformation("Database migrations applied successfully");

        // Now seed the data
        logger.LogInformation("Initializing seed data...");
        await SeedData.Initialize(services, logger);
        logger.LogInformation("Seed data initialization completed successfully");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while applying migrations or seeding the database: {Error}", ex.Message);
    }
}

app.Run();
