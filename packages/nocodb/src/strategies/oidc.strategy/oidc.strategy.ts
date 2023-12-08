import { FactoryProvider, Injectable, Optional } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect'; // Fix import statement
import { UsersService } from '~/services/users/users.service';
import { Request } from 'express';
import { BaseUser, User } from 'src/models';
import { sanitiseUserObj } from '~/utils';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';
@Injectable()
export class OidcStrategy extends PassportStrategy(OpenIDConnectStrategy, 'oidc') {
  constructor(@Optional() clientConfig: any,
    private readonly usersService: UsersService) {
    super(clientConfig);
  }

  async validate(req: Request, profile: any, email: any, done: Function): Promise<any> {
    const emailValue = profile.emails[0]?.value ?? email;
    try {
      const user = await User.getByEmail(emailValue);

      if (user) {
        // If base ID is defined, extract base level roles
        if (req.ncProjectId) {
          const baseUser = await BaseUser.get(req.ncProjectId, user.id);

          user.roles = baseUser?.roles || user.roles;
          done(null, sanitiseUserObj(user));
        } else {
          done(null, sanitiseUserObj(user));
        }
      } else {
        // User not found, create a new user if allowed
        const salt = await promisify(bcrypt.genSalt)(10);
        const newUser = await this.usersService.registerNewUserIfAllowed({
          email_verification_token: null,
          email: emailValue,
          password: '',
          salt,
          req,
        });

        done(null, sanitiseUserObj(newUser));
      }
    } catch (err) {
      done(err, false);
    }
  }

  authorizationParams(options: any) {
    const params = super.authorizationParams(options) as Record<string, any>;

    if (options.state) {
      params.state = options.state;
    }

    return params;
  }

  async authenticate(req: Request, options?: any): Promise<void> {

    return super.authenticate(req, {
      ...options,
      issuer: 'https://beta-sso.mic.gov.vn',
      authorizationURL: 'https://beta-sso.mic.gov.vn/connect/authorize',
      tokenURL: 'https://beta-sso.mic.gov.vn/connect/token',
      userInfoURL: 'https://beta-sso.mic.gov.vn/connect/userinfo',
      clientID: 'AitaClient',
      clientSecret: 'our-client-secret',
      callbackURL: 'https://db.mic.gov.vn/callback',
      scope: ['openid', 'profile', 'email', 'offline_access', 'u.api'],
      passReqToCallback: true,
      filterProtocolClaims: true,
      skipUserProfile: false,
      loadUserInfo: true,
      state: req.query.state,
    });
  }
}

export const OidcStrategyProvider: FactoryProvider = {
  provide: OidcStrategy,
  inject: [UsersService],
  useFactory: async (usersService: UsersService) => {
    const clientConfig = {
      issuer: 'https://beta-sso.mic.gov.vn',
      authorizationURL: 'https://beta-sso.mic.gov.vn/connect/authorize',
      tokenURL: 'https://beta-sso.mic.gov.vn/connect/token',
      userInfoURL: 'https://beta-sso.mic.gov.vn/connect/userinfo',
      clientID: 'AitaClient',
      clientSecret: 'our-client-secret',
      callbackURL: 'https://db.mic.gov.vn/callback',
      scope: ['openid', 'profile', 'email', 'offline_access', 'u.api'],
      passReqToCallback: true,
      filterProtocolClaims: true,
      skipUserProfile: false,
      loadUserInfo: true,
    };

    const strategy = new OidcStrategy(clientConfig, usersService);
    return strategy;
  },
};
