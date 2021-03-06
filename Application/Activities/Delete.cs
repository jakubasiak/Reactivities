using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using MediatR;
using Persistance;

namespace Application.Activities
{
    public class Delete
    {
        public class DeleteCommand : IRequest
                {
                    public Guid Id { get; set; }
                }
        
                public class Handler : IRequestHandler<DeleteCommand>
                {
                    private readonly DataContext context;
                    public Handler(DataContext context)
                    {
                        this.context = context;
        
                    }
                    public async Task<Unit> Handle(DeleteCommand request, CancellationToken cancellationToken)
                    {
                        var activity = await this.context.Activities.FindAsync(request.Id);
                        if(activity == null)
                        {
                            throw new RestException(HttpStatusCode.NotFound, new {activity = "Not found"});
                        }

                        this.context.Remove(activity);
                        var success = await this.context.SaveChangesAsync() > 0;
        
                        if(success) 
                        {
                            return Unit.Value;
                        }
        
                        throw new Exception("Problem saving changes");
                    }
                }
    }
}