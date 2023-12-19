import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { OrgUserRoles } from 'nocodb-sdk';
import { GlobalGuard } from '~/guards/global/global.guard';
import { PagedResponseImpl } from '~/helpers/PagedResponse';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import { MetaApiLimiterGuard } from '~/guards/meta-api-limiter.guard';
import GroupBase from 'src/models/GroupBase';
import { UserOrganizationService } from 'src/services/user-organization/user-organization.service';
@UseGuards(MetaApiLimiterGuard, GlobalGuard)
@Controller()
export class UserOrganizationController {
    constructor(private readonly userOrganizationService: UserOrganizationService) { }

    @Get('/api/v1/userorganizations')
    @Acl('groupBaseList', { scope: 'org' })
    async groupBaseList(@Req() req: Request) {
        return new PagedResponseImpl(
            await this.userOrganizationService.list({
                query: req.query,
            }),
            {
                ...req.query,
                // todo: fix - wrong count
                count: await GroupBase.getGroupBasesCount(req.query),
            },
        );
    }

    @Patch('/api/v1/userOrganization/:userOrganizationId')
    @Acl('groupBaseUpdate', { scope: 'org' })
    async groupBaseUpdate(@Body() body, @Param('userOrganizationId') userOrganizationId: string) {
        return await this.userOrganizationService.update({
            id: userOrganizationId,
            params: body,
        });
    }

    @Delete('/api/v1/userOrganization/:userOrganizationId')
    @Acl('groupBaseDelete', { scope: 'org' })
    async groupBaseDelete(@Param('userOrganizationId') userOrganizationId: string) {
        await this.userOrganizationService.delete({
            id: userOrganizationId
        });
        return { msg: 'The groupBase has been deleted successfully' };
    }
    @Delete('/api/v1/userOrganization/idUser/:idUser')
    @Acl('groupBaseDelete', { scope: 'org' })
    async groupBaseDeleteByBaseId(@Param('idUser') idUser: string) {
        await this.userOrganizationService.deleteByUserId({
            idUser: idUser
        });
        return { msg: 'The groupBase has been deleted successfully' };
    }

    @Post('/api/v1/userOrganization')
    @HttpCode(200)
    @Acl('groupBaseAdd', { scope: 'org' })
    async groupBaseAdd(@Body() body, @Req() req: Request) {
        const result = await this.userOrganizationService.create({
            tokenBody: body,
        });

        return result;
    }

}
