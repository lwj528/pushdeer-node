import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PushDeerUsers } from '../../entity/users.entity';
import { sessionMap } from '../../constant';
import { Utils } from '../../helpers/utils';
import { RedisCoreService } from '../redis-core/redis-core.service';
import { AppleLoginDto } from '../../dto/user.dto';
import { verifyAppleToken } from '../../helpers/verify.login';

@Injectable()
export class LoginService {
  constructor(
    private readonly userService: UserService,
  ) {
  }

  async fakeLogin() {
    const fakeUser = {
      uid: 'JQV8hchTz7YP64sE',
      email: 'fake@gmail.com',
    };
    let user = await this.userService.findOne(fakeUser.uid);
    if (!user) {
      const pushDeerUser = new PushDeerUsers();
      pushDeerUser.email = fakeUser.email;
      pushDeerUser.name = fakeUser.email.split('@')[0];
      pushDeerUser.apple_id = fakeUser.uid;
      pushDeerUser.level = 1;
      user = await this.userService.saveUser(pushDeerUser);
    }
    const token = this.createToken(user);
    sessionMap.set(token, user);
    return token;
  }


  async appleLogin(info: AppleLoginDto) {
    const { idToken } = info
    await verifyAppleToken(idToken)
    return '123';
  }

  async createToken(user: PushDeerUsers) {
    const token = Utils.randomUUID();
    await RedisCoreService.set(token, JSON.stringify(user));
    return token;
  }
}
