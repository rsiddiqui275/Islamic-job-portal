using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MolanaApp.API.DTOs.Messages;
using MolanaApp.API.Services;

namespace MolanaApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessagesController(IMessageService messageService)
    {
        _messageService = messageService;
    }

    [HttpPost]
    public async Task<ActionResult<MessageDto>> SendMessage([FromBody] SendMessageDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var message = await _messageService.SendMessageAsync(userId, dto);
            return Ok(message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("conversations")]
    public async Task<ActionResult<List<ConversationDto>>> GetConversations()
    {
        var userId = GetCurrentUserId();
        var conversations = await _messageService.GetConversationsAsync(userId);
        return Ok(conversations);
    }

    [HttpGet("conversation/{otherUserId}")]
    public async Task<ActionResult<List<MessageDto>>> GetConversation(
        Guid otherUserId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var userId = GetCurrentUserId();
        var messages = await _messageService.GetConversationAsync(userId, otherUserId, page, pageSize);
        return Ok(messages);
    }

    [HttpPost("{id}/read")]
    public async Task<ActionResult> MarkAsRead(Guid id)
    {
        var userId = GetCurrentUserId();
        await _messageService.MarkAsReadAsync(id, userId);
        return NoContent();
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        var count = await _messageService.GetUnreadCountAsync(userId);
        return Ok(count);
    }

    private Guid GetCurrentUserId()
    {
        return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
    }
}
