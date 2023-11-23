// import type { OrganizationType } from 'nocodb-sdk';
import { NcError } from 'src/helpers/catchError';
import Noco from '~/Noco';
import NocoCache from '~/cache/NocoCache';
import { extractProps } from '~/helpers/extractProps';
import { CacheGetType, CacheScope, MetaTable } from '~/utils/globals';
export default class Organization {
    /** Unique identifier for the given user. */
    id: string;
    /**
     * The date that the user was created.
     * @format date
     */
    created_at?: string;
    /**
     * The date that the user was created.
     * @format date
     */
    updated_at?: string;
    name?: string;
    constructor(data: Organization) {
        Object.assign(this, data);
    }

    protected static castType(baseUser: Organization): Organization {
        return baseUser && new Organization(baseUser);
    }

    public static async insert(
        organization: Partial<Organization>,
        ncMeta = Noco.ncMeta,
    ) {
        const insertObj = extractProps(organization, [
            'id',
            'name',
        ]);

        const { id, name } = await ncMeta.metaInsert2(
            null,
            null,
            MetaTable.ORGANIZATIONS,
            insertObj,
            true,
        );
        return this.get(id, ncMeta);
    }
    static async get(id, ncMeta = Noco.ncMeta): Promise<Organization> {

        let user = await ncMeta.metaGet2(null, null, MetaTable.ORGANIZATIONS, id);

        return this.castType(user);
    }
    public static async list(
        {
            limit = 25,
            offset = 0,
            query,
        }: {
            limit?: number | undefined;
            offset?: number | undefined;
            query?: string;
        } = {},
        ncMeta = Noco.ncMeta,
    ) {
        let queryBuilder = ncMeta.knex(MetaTable.ORGANIZATIONS);

        if (offset) queryBuilder = queryBuilder.offset(offset);

        if (limit) queryBuilder = queryBuilder.limit(limit);

        queryBuilder = queryBuilder
            .select(
                `${MetaTable.ORGANIZATIONS}.id`,
                `${MetaTable.ORGANIZATIONS}.name`,
                `${MetaTable.ORGANIZATIONS}.created_at`,
                `${MetaTable.ORGANIZATIONS}.updated_at`,
            )
        //   .select(
        //     ncMeta
        //       .knex(MetaTable.PROJECT_USERS)
        //       .count()
        //       .whereRaw(
        //         `${MetaTable.USERS}.id = ${MetaTable.PROJECT_USERS}.fk_user_id`,
        //       )
        //       .as('projectsCount'),
        //   );
        if (query) {
            queryBuilder.where('name', `%${query.toLowerCase?.()}%`);
        }

        return queryBuilder;
    }

    static async delete(id: string, ncMeta = Noco.ncMeta) {
        if (!id) NcError.badRequest('id is required');

        const org = await this.get(id, ncMeta);

        if (!org) NcError.badRequest('Ogranization not found');

        return await ncMeta.metaDelete(null, null, MetaTable.ORGANIZATIONS, id);
    }


    public static async update(id, org: Partial<Organization>, ncMeta = Noco.ncMeta) {
        const updateObj = extractProps(org, [
            'name',
        ]);
        const existingOrganization = await this.get(id, ncMeta);
        // set meta
        return await ncMeta.metaUpdate(null, null, MetaTable.ORGANIZATIONS, updateObj, id);
    }
}