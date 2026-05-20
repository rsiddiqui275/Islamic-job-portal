using Microsoft.EntityFrameworkCore;
using MolanaApp.API.DTOs.Messages;
using MolanaApp.Domain.Entities;
using MolanaApp.Infrastructure.Data;

namespace MolanaApp.API.Services;

public interface IMessageService
{
    Task<MessageDto> SendMessageAsync(Guid senderId, SendMessageDto dto);
    Task<List<MessageDto>> GetConversationAsync(Guid userId, Guid otherUserId, int page, int pageSize);
    Task<List<ConversationDto>> GetConversationsAsync(Guid userId);
    Task MarkAsReadAsync(Guid messageId, Guid userId);
    Task<int> GetUnreadCountAsync(Guid userId);
}

public class MessageService : IMessageService
{
    private readonly MolanaAppDbContext _context;

    public MessageService(MolanaAppDbContext context)
    {
        _context = context;
    }

    public async Task<MessageDto> SendMessageAsync(Guid senderId, SendMessageDto dto)
    {
        var receiver = await _context.Users.FindAsync(dto.ReceiverId);
        if (receiver == null)
        {
            throw new InvalidOperationException("Receiver not found");
        }

        var message = new Message
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            ReceiverId = dto.ReceiverId,
            JobId = dto.JobId,
            Content = dto.Content,
            ParentMessageId = dto.ParentMessageId,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        return await GetMessageByIdAsync(message.Id) 
            ?? throw new Exception("Failed to send message");
    }

    public async Task<List<MessageDto>> GetConversationAsync(
        Guid userId, Guid otherUserId, int page, int pageSize)
    {
        var messages = await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                        (m.SenderId == otherUserId && m.ReceiverId == userId))
            .OrderByDescending(m => m.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Mark messages as read
        var unreadMessages = messages
            .Where(m => m.ReceiverId == userId && !m.IsRead)
            .ToList();

        foreach (var msg in unreadMessages)
        {
            msg.IsRead = true;
            msg.ReadAt = DateTime.UtcNow;
        }

        if (unreadMessages.Any())
        {
            await _context.SaveChangesAsync();
        }

        return messages.Select(MapToMessageDto).Reverse().ToList();
    }

    public async Task<List<ConversationDto>> GetConversationsAsync(Guid userId)
    {
        var conversations = await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .Select(g => new
            {
                OtherUserId = g.Key,
                LastMessage = g.OrderByDescending(m => m.SentAt).First(),
                UnreadCount = g.Count(m => m.ReceiverId == userId && !m.IsRead)
            })
            .OrderByDescending(c => c.LastMessage.SentAt)
            .ToListAsync();

        var result = new List<ConversationDto>();

        foreach (var conv in conversations)
        {
            var otherUser = await _context.Users.FindAsync(conv.OtherUserId);
            if (otherUser != null)
            {
                result.Add(new ConversationDto
                {
                    UserId = otherUser.Id,
                    FirstName = otherUser.FirstName,
                    LastName = otherUser.LastName,
                    ProfileImageUrl = otherUser.ProfileImageUrl,
                    LastMessage = conv.LastMessage.Content.Length > 50 
                        ? conv.LastMessage.Content.Substring(0, 50) + "..."
                        : conv.LastMessage.Content,
                    LastMessageAt = conv.LastMessage.SentAt,
                    UnreadCount = conv.UnreadCount
                });
            }
        }

        return result;
    }

    public async Task MarkAsReadAsync(Guid messageId, Guid userId)
    {
        var message = await _context.Messages
            .FirstOrDefaultAsync(m => m.Id == messageId && m.ReceiverId == userId);

        if (message != null && !message.IsRead)
        {
            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _context.Messages
            .CountAsync(m => m.ReceiverId == userId && !m.IsRead);
    }

    private async Task<MessageDto?> GetMessageByIdAsync(Guid messageId)
    {
        var message = await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .FirstOrDefaultAsync(m => m.Id == messageId);

        return message != null ? MapToMessageDto(message) : null;
    }

    private static MessageDto MapToMessageDto(Message message)
    {
        return new MessageDto
        {
            Id = message.Id,
            SenderId = message.SenderId,
            ReceiverId = message.ReceiverId,
            JobId = message.JobId,
            Content = message.Content,
            IsRead = message.IsRead,
            SentAt = message.SentAt,
            ReadAt = message.ReadAt,
            Sender = new UserSummaryDto
            {
                Id = message.Sender.Id,
                FirstName = message.Sender.FirstName,
                LastName = message.Sender.LastName,
                ProfileImageUrl = message.Sender.ProfileImageUrl
            },
            Receiver = new UserSummaryDto
            {
                Id = message.Receiver.Id,
                FirstName = message.Receiver.FirstName,
                LastName = message.Receiver.LastName,
                ProfileImageUrl = message.Receiver.ProfileImageUrl
            }
        };
    }
}
