using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace LordofTheReads.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _senderEmail;
        private readonly string _senderName;
        private readonly bool _enableSsl;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            
            // Add null checking and default values to avoid warnings
            _smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "localhost";
            _smtpPort = int.TryParse(_configuration["EmailSettings:SmtpPort"], out int port) ? port : 25;
            _smtpUsername = _configuration["EmailSettings:SmtpUsername"] ?? string.Empty;
            _smtpPassword = _configuration["EmailSettings:SmtpPassword"] ?? string.Empty;
            _senderEmail = _configuration["EmailSettings:SenderEmail"] ?? "noreply@example.com";
            _senderName = _configuration["EmailSettings:SenderName"] ?? "Lord of The Reads";
            _enableSsl = bool.TryParse(_configuration["EmailSettings:EnableSsl"], out bool ssl) ? ssl : true;
            
            // Log the configuration to help with troubleshooting
            _logger.LogInformation($"Email service initialized with SMTP server: {_smtpServer}:{_smtpPort}");
        }

        public async Task SendOrderConfirmationAsync(string email, string username, int orderId, string claimCode, decimal totalAmount, string orderDetails)
        {
            var subject = $"Order Confirmation - Order #{orderId}";
            var body = new StringBuilder();
            body.AppendLine($"<h2>Thank you for your order, {username}!</h2>");
            body.AppendLine("<p>Your order has been received. Our staff will process your order in-store to complete it.</p>");
            body.AppendLine($"<p><strong>Order ID:</strong> {orderId}</p>");
            body.AppendLine($"<p><strong>Claim Code:</strong> <mark>{claimCode}</mark></p>");
            body.AppendLine($"<p><strong>Total Amount:</strong> ${totalAmount:F2}</p>");
            body.AppendLine("<h3>Order Details:</h3>");
            body.AppendLine(orderDetails);
            body.AppendLine("<p>You can pick up your books at our store during business hours.</p>");
            body.AppendLine("<p>Don't forget to bring your Claim Code that is included in this email.</p>");
            body.AppendLine("<p>You will receive another email when your order is completed.</p>");
            body.AppendLine("<p>Thank you for shopping with Lord of The Reads!</p>");

            await SendEmailAsync(email, subject, body.ToString());
        }

        public async Task SendOrderCompletedAsync(string email, string username, int orderId)
        {
            var subject = $"Your Order #{orderId} is Completed!";
            var body = new StringBuilder();
            body.AppendLine($"<h2>Hello {username},</h2>");
            body.AppendLine($"<p>Great news! Your Order #{orderId} has been successfully completed. We hope you enjoy your books.</p>");
            body.AppendLine("<p>Thank you for shopping with us!</p>");
            body.AppendLine("<p>Please don't forget to leave a review on your order page to share your feedback.</p>");
            
            await SendEmailAsync(email, subject, body.ToString());
        }

        private async Task SendEmailAsync(string to, string subject, string htmlMessage)
        {
            try
            {
                _logger.LogInformation($"Preparing to send email to {to} with subject: {subject}");
                _logger.LogInformation($"Using SMTP server: {_smtpServer}:{_smtpPort}, SSL: {_enableSsl}");
                _logger.LogInformation($"Sender: {_senderEmail} ({_senderName})");
                
                var message = new MailMessage
                {
                    From = new MailAddress(_senderEmail, _senderName),
                    Subject = subject,
                    Body = htmlMessage,
                    IsBodyHtml = true
                };
                
                message.To.Add(new MailAddress(to));
                _logger.LogInformation($"Message prepared with recipient: {to}");

                using (var client = new SmtpClient(_smtpServer, _smtpPort))
                {
                    _logger.LogInformation("Configuring SMTP client...");
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
                    client.EnableSsl = _enableSsl;
                    client.Timeout = 30000; // 30 seconds timeout
                    
                    _logger.LogInformation("Attempting to send email...");
                    await client.SendMailAsync(message);
                    _logger.LogInformation("SendMailAsync completed without exceptions");
                }
                
                _logger.LogInformation($"Email sent successfully to {to}");
            }
            catch (SmtpException smtpEx)
            {
                _logger.LogError(smtpEx, $"SMTP Error sending email to {to}: {smtpEx.Message}, Status Code: {smtpEx.StatusCode}");
                _logger.LogError($"SMTP Error details: {smtpEx.StackTrace}");
                // Don't throw exception here to prevent order operations from failing
                // due to email sending issues
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"General error sending email to {to}: {ex.Message}");
                _logger.LogError($"Error details: {ex.StackTrace}");
                // Don't throw exception here to prevent order operations from failing
                // due to email sending issues
            }
        }
    }
}
