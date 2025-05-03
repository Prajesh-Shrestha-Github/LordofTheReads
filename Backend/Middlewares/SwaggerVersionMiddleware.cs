using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace LordofTheReads.Middlewares
{
    // This middleware ensures that the OpenAPI version is correctly specified in the Swagger JSON
    public class SwaggerVersionMiddleware
    {
        private readonly RequestDelegate _next;

        public SwaggerVersionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var originalBodyStream = context.Response.Body;

            try
            {
                // Check if this is a swagger.json request
                if (context.Request.Path.Value != null && 
                    context.Request.Path.Value.Contains("/swagger/v1/swagger.json"))
                {
                    using var responseBody = new MemoryStream();
                    context.Response.Body = responseBody;

                    // Continue processing to get the original swagger.json
                    await _next(context);

                    // Reset the response body position to read it
                    responseBody.Seek(0, SeekOrigin.Begin);
                    var responseContent = await new StreamReader(responseBody).ReadToEndAsync();

                    // Parse the JSON
                    JObject swaggerDoc = JObject.Parse(responseContent);

                    // Set or update the openapi version field explicitly
                    swaggerDoc["openapi"] = "3.0.1";
                    
                    // Remove swagger version field if present (shouldn't mix them)
                    if (swaggerDoc.ContainsKey("swagger"))
                    {
                        swaggerDoc.Remove("swagger");
                    }

                    // Convert back to string
                    var modifiedContent = JsonConvert.SerializeObject(swaggerDoc);

                    // Set the content length and reset response body
                    context.Response.ContentLength = Encoding.UTF8.GetBytes(modifiedContent).Length;
                    context.Response.Body = originalBodyStream;

                    // Write the modified response body
                    await context.Response.WriteAsync(modifiedContent);
                }
                else
                {
                    // For non-swagger requests, just pass through
                    context.Response.Body = originalBodyStream;
                    await _next(context);
                }
            }
            finally
            {
                // Ensure we restore the original response body for other middleware
                context.Response.Body = originalBodyStream;
            }
        }
    }

    // Extension method to easily add the middleware
    public static class SwaggerVersionMiddlewareExtensions
    {
        public static IApplicationBuilder UseSwaggerVersionMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<SwaggerVersionMiddleware>();
        }
    }
}
