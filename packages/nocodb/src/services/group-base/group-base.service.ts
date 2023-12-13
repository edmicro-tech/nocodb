import { Injectable } from '@nestjs/common';
import { AppEvents, ProjectRoles } from 'nocodb-sdk';
import type { NcRequest } from '~/interface/config';
import { AppHooksService } from '~/services/app-hooks/app-hooks.service';
import { validatePayload } from '~/helpers';
import { NcError } from '~/helpers/catchError';
import { Model, ModelRoleVisibility, View } from '~/models';
import { MetaService } from 'src/meta/meta.service';
import { BasesService } from '../bases.service';
import { MetaTable } from 'src/utils/globals';
import { PagedResponseImpl } from 'src/helpers/PagedResponse';
import { extractProps } from 'src/helpers/extractProps';
import GroupBase from 'src/models/GroupBase';

@Injectable()
export class GroupBaseService {
    constructor(
        protected metaService: MetaService,
        protected basesService: BasesService,
    ) {
    }

    async list(param: {
        // todo: add better typing
        query: Record<string, any>;
    }) {
        return await GroupBase.list(
            param.query
        )
    };
    async create(param: {
        tokenBody: GroupBase;
    }) {
        return await GroupBase.insert({
            ...param.tokenBody,
        });
    }
    async update({
        id,
        params,
    }: {
        id: string;
        params: {
            idBase?: string,
            idGroup?: string,
        };
    }) {
        const updateObj = extractProps(params, ['idBase', 'idGroup']);

        return await GroupBase.update(id, updateObj);
    }
    async delete(param: { id }) {

        const groupBase = await GroupBase.get(param.id);
        if (
            !groupBase
        ) {
            NcError.notFound('GroupBase not found');
        }

        // todo: verify token belongs to the user
        return await GroupBase.delete(param.id);
    }
    async deleteByBaseId(param: { idBase }) {
        // todo: verify token belongs to the user
        return await GroupBase.deleteByBaseId(param.idBase);
    }

}