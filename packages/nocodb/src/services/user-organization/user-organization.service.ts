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
import UserOrganization from 'src/models/UserOrganization';

@Injectable()
export class UserOrganizationService {
    constructor(
        protected metaService: MetaService,
    ) {
    }

    async list(param: {
        // todo: add better typing
        query: Record<string, any>;
    }) {
        return await UserOrganization.list(
            param.query
        )
    };
    async create(param: {
        tokenBody: UserOrganization;
    }) {
        return await UserOrganization.insert({
            ...param.tokenBody,
        });
    }
    async update({
        id,
        params,
    }: {
        id: string;
        params: {
            idUser?: string,
            idOrganization?: string,
        };
    }) {
        const updateObj = extractProps(params, ['idUser', 'idOrganization']);

        return await UserOrganization.update(id, updateObj);
    }
    async delete(param: { id }) {

        const groupBase = await UserOrganization.get(param.id);
        if (
            !groupBase
        ) {
            NcError.notFound('UserOrganization not found');
        }

        // todo: verify token belongs to the user
        return await UserOrganization.delete(param.id);
    }
    async deleteByUserId(param: { idUser }) {
        // todo: verify token belongs to the user
        return await UserOrganization.deleteByUserId(param.idUser);
    }

}