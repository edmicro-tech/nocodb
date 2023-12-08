import { FactoryProvider, Injectable, Optional } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-openidconnect'; // Fix import statement
import { UsersService } from '~/services/users/users.service';
import { Request } from 'express';
import { BaseUser, User } from 'src/models';
import { sanitiseUserObj } from '~/utils';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';
import { VerifyCallback } from 'passport-google-oauth20';
@Injectable()
export class OidcStrategy extends PassportStrategy(Strategy, 'openidconnect') {
  constructor(@Optional() clientConfig: any,
    private readonly usersService: UsersService) {
    super(clientConfig);
  }

  async validate(req: Request, issuer: any, profile: any, done: VerifyCallback): Promise<any> {
    console.log(profile);
    const email = profile.emails[0].value;
    try {
      const user = await User.getByEmail(email);
      if (user) {
        // If base ID is defined, extract base level roles
        if (req.ncProjectId) {
          const baseUser = await BaseUser.get(req.ncProjectId, user.id);

          user.roles = baseUser?.roles || user.roles;
          console.log(user);

          done(null, sanitiseUserObj(user));

        } else {
          console.log(user);

          done(null, sanitiseUserObj(user));

        }
      } else {
        // User not found, create a new user if allowed
        const salt = await promisify(bcrypt.genSalt)(10);
        const newUser = await this.usersService.registerNewUserIfAllowed({
          email_verification_token: null,
          email: profile.emails[0].value,
          password: '',
          salt,
          req,
        });
        console.log(user);

        // return newUser;
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
