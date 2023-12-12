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
import { GroupService } from 'src/services/group/group.service';
import Group from 'src/models/Group';

@Controller()
@UseGuards(MetaApiLimiterGuard, GlobalGuard)
export class GroupController {
    constructor(private readonly groupService: GroupService) { }

    @Get('/api/v1/group')
    @Acl('groupList')
    async groupList(@Req() req: Request) {
        return new PagedResponseImpl(
            await this.groupService.list({
                query: req.query,
            }),
            {
                ...req.query,
                // todo: fix - wrong count
                count: await Group.getGroupsCount(req.query),
            },
        );
    }

    @Patch('/api/v1/groups/:groupId')
    @Acl('groupUpdate')
    async groupUpdate(@Body() body, @Param('groupId') groupId: string) {
        return await this.groupService.update({
            id: groupId,
            params: body,
        });
    }

    @Delete('/api/v1/groups/:groupId')
    @Acl('groupDelete')
    async groupDelete(@Param('groupId') groupId: string) {
        await this.groupService.delete({
            id: groupId
        });
        return { msg: 'The group has been deleted successfully' };
    }

    @Post('/api/v1/groups')
    @HttpCode(200)
    @Acl('groupAdd')
    async groupAdd(@Body() body, @Req() req: Request) {
        const result = await this.groupService.create({
            tokenBody: body,
        });

        return result;
    }

}
