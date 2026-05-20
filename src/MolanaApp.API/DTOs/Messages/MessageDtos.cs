namespace MolanaApp.API.DTOs.Messages;

public class SendMessageDto
{
    public Guid ReceiverId { get; set; }
    public Guid? JobId { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid? ParentMessageId { get; set; }
}

public class MessageDto
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public Guid? JobId { get; set; }
    
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; }
    public DateTime? ReadAt { get; set; }
    
    public UserSummaryDto Sender { get; set; } = null!;
    public UserSummaryDto Receiver { get; set; } = null!;
}

public class UserSummaryDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
}

public class ConversationDto
{
    public Guid UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public string LastMessage { get; set; } = string.Empty;
    public DateTime LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
}
