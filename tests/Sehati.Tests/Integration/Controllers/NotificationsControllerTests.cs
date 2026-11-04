using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Sehati.Application.DTOs.Auth;
using Sehati.Application.DTOs.Notifications;
using Sehati.Domain.Enums;
using Sehati.Tests.Common;

namespace Sehati.Tests.Integration.Controllers;

public class NotificationsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public NotificationsControllerTests(CustomWebApplicationFactory factory)
    {
        factory.EnsureDatabaseSeeded();
        _client = factory.CreateClient();
    }

    private async Task<(string token, int userId)> RegisterAndGetTokenAsync(string roleName)
    {
        var registerDto = new RegisterDto
        {
            Email = $"{roleName.ToLower()}_{Guid.NewGuid():N}@sehati.com",
            Password = TestAuthHelper.DefaultTestPassword,
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            FullName = $"{roleName} User",
            RoleName = roleName,
            Specialty = roleName == "Doctor" ? "General Practice" : null,
            LicenseNumber = roleName == "Doctor" ? "LIC-" + Random.Shared.Next(1000, 9999) : null
        };

        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", registerDto);
        response.EnsureSuccessStatusCode();

        var tokens = await response.Content.ReadFromJsonAsync<TokenResponseDto>(JsonOptions);
        return (tokens!.AccessToken, tokens.User.UserId);
    }

    private static HttpRequestMessage CreateAuthorizedRequest(HttpMethod method, string url, string token, object? body = null)
    {
        var request = new HttpRequestMessage(method, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (body != null)
        {
            request.Content = JsonContent.Create(body);
        }
        return request;
    }

    [Fact]
    public async Task CreateNotification_And_GetNotifications_Succeeds()
    {
        // Arrange
        var (adminToken, _) = await RegisterAndGetTokenAsync("ClinicAdmin");
        var (patientToken, patientUserId) = await RegisterAndGetTokenAsync("Patient");

        var createDto = new CreateNotificationDto
        {
            UserId = patientUserId,
            Title = "Welcome to Sehati",
            Message = "Your digital health passport is ready.",
            Type = NotificationType.System
        };

        // Act 1: Create notification
        var postReq = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/notifications", adminToken, createDto);
        var postRes = await _client.SendAsync(postReq);

        // Assert 1
        postRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await postRes.Content.ReadFromJsonAsync<NotificationDto>(JsonOptions);
        created.Should().NotBeNull();
        created!.Title.Should().Be("Welcome to Sehati");

        // Act 2: Read notifications as patient
        var getReq = CreateAuthorizedRequest(HttpMethod.Get, "/api/v1/notifications", patientToken);
        var getRes = await _client.SendAsync(getReq);

        // Assert 2
        getRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await getRes.Content.ReadFromJsonAsync<List<NotificationDto>>(JsonOptions);
        list.Should().NotBeNull();
        list!.Should().Contain(n => n.NotificationId == created.NotificationId);
    }
}

