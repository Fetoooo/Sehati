using System.Text.Json.Serialization;

namespace Sehati.Application.Common.Models;

public class PaginatedList<T>
{
    [JsonPropertyName("items")]
    public IReadOnlyCollection<T> Items { get; set; } = Array.Empty<T>();

    [JsonPropertyName("pageNumber")]
    public int PageNumber { get; set; }

    [JsonPropertyName("totalPages")]
    public int TotalPages { get; set; }

    [JsonPropertyName("totalCount")]
    public int TotalCount { get; set; }

    public PaginatedList()
    {
    }

    public PaginatedList(IReadOnlyCollection<T> items, int count, int pageNumber, int pageSize)
    {
        PageNumber = pageNumber;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        TotalCount = count;
        Items = items;
    }

    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}
