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

@Injectable()
export class OrganizationService {
    constructor(
        protected metaService: MetaService,
        protected basesService: BasesService,
    ) {
    }

    async list(param: { query: any }) {
        return new PagedResponseImpl(
            await Organization.list({
                query: param.query
            }),
            {
                ...param.query
            }
        )
    };
}