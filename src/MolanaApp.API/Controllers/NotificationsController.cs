using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MolanaApp.API.Services;

namespace MolanaApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> GetNotifications([FromQuery] int count = 20)
    {
        var userId = GetCurrentUserId();
        var notifications = await _notificationService.GetUserNotificationsAsync(userId, count);
        return Ok(notifications);
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(count);
    }

    [HttpPost("{id}/read")]
    public async Task<ActionResult> MarkAsRead(Guid id)
    {
        var userId = GetCurrentUserId();
        await _notificationService.MarkAsReadAsync(id, userId);
        return NoContent();
    }

    [HttpPost("read-all")]
    public async Task<ActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();
        await _notificationService.MarkAllAsReadAsync(userId);
        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
    }
}
