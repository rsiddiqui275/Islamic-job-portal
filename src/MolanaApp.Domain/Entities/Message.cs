namespace MolanaApp.Domain.Entities;

public class Message
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public Guid? JobId { get; set; } // Optional reference to job context
    
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }
    
    // For threading/conversation
    public Guid? ParentMessageId { get; set; }
    
    // Navigation
    public User Sender { get; set; } = null!;
    public User Receiver { get; set; } = null!;
    public Job? Job { get; set; }
    public Message? ParentMessage { get; set; }
    public ICollection<Message> Replies { get; set; } = new List<Message>();
}
