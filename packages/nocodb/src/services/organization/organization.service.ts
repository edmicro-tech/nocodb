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
import { Organization } from '~/models';
import { PagedResponseImpl } from 'src/helpers/PagedResponse';
import { extractProps } from 'src/helpers/extractProps';

@Injectable()
export class OrganizationService {
    constructor(
        protected metaService: MetaService,
        protected basesService: BasesService,
    ) {
    }

    async list(param: { query: any }) {
        return await Organization.list({
            query: param.query
        }),
        {
            ...param.query,
            count: await Organization.getUsersCount({
                ...param.query,
            }),
        }
    };
    async create(param: {
        tokenBody: Organization;
    }) {
        return await Organization.insert({
            ...param.tokenBody,
        });
    }
    async update({
        id,
        params,
    }: {
        id: number;
        params: {
            name?: string;
        };
    }) {
        const updateObj = extractProps(params, ['name']);

        return await Organization.update(id, updateObj);
    }
    async delete(param: { id }) {
        const organization = await Organization.get(param.id);
        if (
            organization
        ) {
            NcError.notFound('Organization not found');
        }

        // todo: verify token belongs to the user
        return await Organization.delete(param.id);
    }

}