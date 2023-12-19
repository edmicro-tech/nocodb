import { NcError } from 'src/helpers/catchError';
import Noco from '~/Noco';
import { extractProps } from '~/helpers/extractProps';
import { CacheGetType, CacheScope, MetaTable } from '~/utils/globals';
export default class UserOrganization {
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
    idUser: string;
    idOrganization: string;
    constructor(data: UserOrganization) {
        Object.assign(this, data);
    }

    protected static castType(groupBase: UserOrganization): UserOrganization {
        return UserOrganization && new UserOrganization(groupBase);
    }

    public static async insert(
        UserOrganization: Partial<UserOrganization>,
        ncMeta = Noco.ncMeta,
    ) {
        const insertObj = extractProps(UserOrganization, [
            // 'id',
            'idUser',
            'idOrganization',
        ]);
        const org = await this.get({ idUser: insertObj.idUser }, ncMeta);
        if (org || insertObj.idOrganization == null) {
            await this.deleteByUserId(insertObj.idUser);
        }
        if (insertObj.idOrganization != null) {
            const { id, idUser, idOrganization } = await ncMeta.metaInsert2(
                null,
                null,
                MetaTable.USER_ORGANIZATION,
                insertObj,
                false,
            );
            return this.get(id, ncMeta);
        }
        return {};
    }

    static async get(id, ncMeta = Noco.ncMeta): Promise<UserOrganization> {

        let user = await ncMeta.metaGet2(null, null, MetaTable.USER_ORGANIZATION, id);

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
        let queryBuilder = ncMeta.knex(MetaTable.USER_ORGANIZATION);

        if (offset) queryBuilder = queryBuilder.offset(offset);

        if (limit) queryBuilder = queryBuilder.limit(limit);

        queryBuilder = queryBuilder
            .select(
                `${MetaTable.USER_ORGANIZATION}.id`,
                `${MetaTable.USER_ORGANIZATION}.idUser`,
                `${MetaTable.USER_ORGANIZATION}.idOrganization`,
                `${MetaTable.USER_ORGANIZATION}.created_at`,
                `${MetaTable.USER_ORGANIZATION}.updated_at`,
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
        // if (query) {
        //     queryBuilder.where('name', 'like', `%${query.toLowerCase?.()}%`);
        // }
        return queryBuilder;
    }

    static async delete(id: string, ncMeta = Noco.ncMeta) {
        if (!id) NcError.badRequest('id is required');

        const org = await this.get(id, ncMeta);

        if (!org) NcError.badRequest('UserOrganization not found');

        return await ncMeta.metaDelete(null, null, MetaTable.USER_ORGANIZATION, id);
    }
    static async deleteByUserId(idUser: string, ncMeta = Noco.ncMeta) {
        if (!idUser) NcError.badRequest('idUser is required');

        const org = await this.get({ idUser: idUser }, ncMeta);

        if (!org) NcError.badRequest('UserOrganization not found');

        return await ncMeta.metaDelete(null, null, MetaTable.USER_ORGANIZATION, { idUser: idUser });
    }


    public static async update(id, org: Partial<UserOrganization>, ncMeta = Noco.ncMeta) {
        const updateObj = extractProps(org, [
            'idUser',
            'idOrganization'
        ]);
        const existingUserOrganization = await this.get(id, ncMeta);
        // set meta
        return await ncMeta.metaUpdate(null, null, MetaTable.USER_ORGANIZATION, updateObj, id);
    }


    public static async getUserOrganizationsCount(
        {
            query,
        }: {
            query?: string;
        },
        ncMeta = Noco.ncMeta,
    ): Promise<number> {
        const queryBuilder = ncMeta.knex(MetaTable.USER_ORGANIZATION);

        // if (query) {
        //     queryBuilder.where('name', `%${query.toLowerCase?.()}%`);
        // }

        return (await queryBuilder.count('id', { as: 'count' }).first()).count;
    }
}