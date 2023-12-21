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
import Group from 'src/models/Group';

@Injectable()
export class GroupService {
    constructor(
        protected metaService: MetaService,
        protected basesService: BasesService,
    ) {
    }

    async list(param: {
        // todo: add better typing
        query: Record<string, any>;
    }) {
        return await Group.list(
            param.query
        )
    };
    async create(param: {
        tokenBody: Group;
    }) {
        return await Group.insert({
            ...param.tokenBody,
        });
    }
    async createChild(param: {
        tokenBody: Group;
    }) {
        return await Group.insertChildFolder({
            ...param.tokenBody,
        });
    }
    async update({
        id,
        params,
    }: {
        id: string;
        params: {
            name?: string;
        };
    }) {
        const updateObj = extractProps(params, ['name']);

        return await Group.update(id, updateObj);
    }
    async delete(param: { id }) {

        const group = await Group.get(param.id);
        if (
            !group
        ) {
            NcError.notFound('Group not found');
        }

        // todo: verify token belongs to the user
        return await Group.delete(param.id);
    }

}