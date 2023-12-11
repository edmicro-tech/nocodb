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
import { OrganizationService } from '~/services/organization/organization.service';
import { Organization, User } from '~/models';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import { MetaApiLimiterGuard } from '~/guards/meta-api-limiter.guard';

@Controller()
@UseGuards(MetaApiLimiterGuard, GlobalGuard)
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) { }

    @Get('/api/v1/organization')
    @Acl('organizationList', {
        scope: 'org',
        allowedRoles: [OrgUserRoles.SUPER_ADMIN],
        blockApiTokenAccess: true,
    })
    async organizationList(@Req() req: Request) {
        return new PagedResponseImpl(
            await this.organizationService.list({
                query: req.query,
            }),
            {
                ...req.query,
                // todo: fix - wrong count
                count: await Organization.getUsersCount(req.query),
            },
        );
    }

    @Patch('/api/v1/organizations/:organizationId')
    @Acl('organizationUpdate', {
        scope: 'org',
        allowedRoles: [OrgUserRoles.SUPER_ADMIN],
        blockApiTokenAccess: true,
    })
    async organizationUpdate(@Body() body, @Param('organizationId') organizationId: number) {
        return await this.organizationService.update({
            id: organizationId,
            params: body,
        });
    }

    @Delete('/api/v1/organizations/:organizationId')
    @Acl('organizationDelete', {
        scope: 'org',
        allowedRoles: [OrgUserRoles.SUPER_ADMIN],
        blockApiTokenAccess: true,
    })
    async organizationDelete(@Param('organizationId') organizationId: number) {
        await this.organizationService.delete({
            id: organizationId
        });
        return { msg: 'The organization has been deleted successfully' };
    }

    @Post('/api/v1/organizations')
    @HttpCode(200)
    @Acl('organizationAdd', {
        scope: 'org',
        allowedRoles: [OrgUserRoles.SUPER_ADMIN],
        blockApiTokenAccess: true,
    })
    async organizationAdd(@Body() body, @Req() req: Request) {
        const result = await this.organizationService.create({
            tokenBody: body,
        });

        return result;
    }

}
