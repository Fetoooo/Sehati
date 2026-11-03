namespace Sehati.Tests.Common;

public static class TestAuthHelper
{
    public static string CreateValidPassword() => $"Test_{Guid.NewGuid():N}!Aa1";
    public const string DefaultTestPassword = "TestPassword_Mock123!";
}
