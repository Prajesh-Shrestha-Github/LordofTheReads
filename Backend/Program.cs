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

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
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
});

// Configure JWT Authentication
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JWT"));
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<PasswordService>();

// Configure Authentication
builder.Services.AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"])),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JWT:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["JWT:Audience"],
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


app.UseHttpsRedirection();

// Add authentication middleware before authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
