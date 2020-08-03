using System.Threading;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Persistance;

namespace Application.User
{
    public class CurrentUser
    {
        public class Query : IRequest<User> { }
        public class Handler : IRequestHandler<Query, User>
        {
            private readonly UserManager<AppUser> userManager;
            private readonly IJwtGenerator jwtGenerator;
            private readonly IUserAccessor userAccessor;

            public Handler(UserManager<AppUser> userManager,
             IJwtGenerator jwtGenerator,
             IUserAccessor userAccessor)
            {
                this.userAccessor = userAccessor;
                this.jwtGenerator = jwtGenerator;
                this.userManager = userManager;

            }

            public async Task<User> Handle(Query request, CancellationToken cancellationToken)
            {
                var user = await this.userManager.FindByNameAsync(this.userAccessor.GetCurrentUsername());

                return new User()
                {
                    DisplayName = user.DisplayName,
                    Username = user.UserName,
                    Token = this.jwtGenerator.CreateToken(user),
                    Image = null
                };
            }
        }
    }
}