using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using Application.Interfaces;
using Application.Validators;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Persistance;

namespace Application.User
{
    public class Register
    {
        public class Command : IRequest<User>
        {
            public string DisplayName { get; set; }
            public string Username { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.DisplayName).NotEmpty();
                RuleFor(x => x.Username).NotEmpty();
                RuleFor(x => x.Email).NotEmpty().EmailAddress();
                RuleFor(x => x.Password).Password();                
            }
        }

        public class Handler : IRequestHandler<Command, User>
        {
            private readonly DataContext context;
            private readonly UserManager<AppUser> userManager;
            private readonly IJwtGenerator jwtGenerator;
            public Handler(DataContext context,
             UserManager<AppUser> userManager,
             IJwtGenerator jwtGenerator)
            {
                this.userManager = userManager;
                this.context = context;
                this.jwtGenerator = jwtGenerator;

            }
            public async Task<User> Handle(Command request, CancellationToken cancellationToken)
            {
                if (await this.context.Users.AnyAsync(x => x.Email == request.Email))
                {
                    throw new RestException(HttpStatusCode.BadRequest, new { Email = "Email already exists" });
                }

                if (await this.context.Users.AnyAsync(x => x.UserName == request.Username))
                {
                    throw new RestException(HttpStatusCode.BadRequest, new { UserName = "Username already exists" });
                }

                var user = new AppUser()
                {
                    DisplayName = request.DisplayName,
                    UserName = request.Username,
                    Email = request.Email
                };

                var result = await this.userManager.CreateAsync(user, request.Password);

                if (result.Succeeded)
                {
                    return new User()
                    {
                        DisplayName = user.DisplayName,
                        Token = this.jwtGenerator.CreateToken(user),
                        Username = user.UserName,
                        Image = null
                    };
                }

                throw new Exception("Problem creating user");
            }
        }
    }
}