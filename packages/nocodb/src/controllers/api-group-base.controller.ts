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
import { GroupBaseService } from 'src/services/group-base/group-base.service';

@Controller()
@UseGuards(MetaApiLimiterGuard, GlobalGuard)
export class GroupBaseController {
    constructor(private readonly groupBaseService: GroupBaseService) { }

    @Get('/api/v1/groupBase')
    @Acl('groupBaseList')
    async groupBaseList(@Req() req: Request) {
        return new PagedResponseImpl(
            await this.groupBaseService.list({
                query: req.query,
            }),
            {
                ...req.query,
                // todo: fix - wrong count
                count: await GroupBase.getGroupBasesCount(req.query),
            },
        );
    }

    @Patch('/api/v1/groupBases/:groupBaseId')
    @Acl('groupBaseUpdate')
    async groupBaseUpdate(@Body() body, @Param('groupBaseId') groupBaseId: string) {
        return await this.groupBaseService.update({
            id: groupBaseId,
            params: body,
        });
    }

    @Delete('/api/v1/groupBases/:groupBaseId')
    @Acl('groupBaseDelete')
    async groupBaseDelete(@Param('groupBaseId') groupBaseId: string) {
        await this.groupBaseService.delete({
            id: groupBaseId
        });
        return { msg: 'The groupBase has been deleted successfully' };
    }
    @Delete('/api/v1/groupBases/idBase/:idBase')
    @Acl('groupBaseDelete')
    async groupBaseDeleteByBaseId(@Param('idBase') idBase: string) {
        await this.groupBaseService.deleteByBaseId({
            idBase: idBase
        });
        return { msg: 'The groupBase has been deleted successfully' };
    }

    @Post('/api/v1/groupBases')
    @HttpCode(200)
    @Acl('groupBaseAdd')
    async groupBaseAdd(@Body() body, @Req() req: Request) {
        const result = await this.groupBaseService.create({
            tokenBody: body,
        });

        return result;
    }

}
