using LordofTheReads.Database;
using LordofTheReads.Middlewares;
using LordofTheReads.Services;
using LordofTheReads.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text;
using System.Text.Json.Serialization;

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
              .WithExposedHeaders("WWW-Authenticate")
              .SetIsOriginAllowed(origin => true); // Allow any origin temporarily for development
    });
});

// Configure JSON serialization to handle circular references
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
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

builder.Services.AddDbContext<AppDbContext>(
    (options) =>
    {
        options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")).LogTo(Console.WriteLine);
    }
);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", 
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

builder.Services.AddScoped<IBookService, BookService>();
// Register cart service
builder.Services.AddScoped<ICartService, CartService>();
// Register bookmark service
builder.Services.AddScoped<IBookmarkService, BookmarkService>();

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

app.UseCors("AllowReactApp");

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowFrontend");

// Add authentication middleware before authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed the database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("SeedData");
    
    try
    {
        logger.LogInformation("Initializing seed data...");
        await SeedData.Initialize(services, logger);
        logger.LogInformation("Seed data initialization completed successfully");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while seeding the database");
    }
}

app.Run();
