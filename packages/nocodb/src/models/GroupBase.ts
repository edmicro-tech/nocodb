import { NcError } from 'src/helpers/catchError';
import Noco from '~/Noco';
import { extractProps } from '~/helpers/extractProps';
import { CacheGetType, CacheScope, MetaTable } from '~/utils/globals';
export default class GroupBase {
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
    idGroup: string;
    idBase: string;
    constructor(data: GroupBase) {
        Object.assign(this, data);
    }

    protected static castType(groupBase: GroupBase): GroupBase {
        return GroupBase && new GroupBase(groupBase);
    }

    public static async insert(
        GroupBase: Partial<GroupBase>,
        ncMeta = Noco.ncMeta,
    ) {
        const insertObj = extractProps(GroupBase, [
            // 'id',
            'idGroup',
            'idBase',
        ]);

        const { id, idGroup, idBase } = await ncMeta.metaInsert2(
            null,
            null,
            MetaTable.GROUP_BASE,
            insertObj,
            false,
        );
        return this.get(id, ncMeta);
    }

    static async get(id, ncMeta = Noco.ncMeta): Promise<GroupBase> {

        let user = await ncMeta.metaGet2(null, null, MetaTable.GROUP_BASE, id);

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
        let queryBuilder = ncMeta.knex(MetaTable.GROUP_BASE);

        if (offset) queryBuilder = queryBuilder.offset(offset);

        if (limit) queryBuilder = queryBuilder.limit(limit);

        queryBuilder = queryBuilder
            .select(
                `${MetaTable.GROUP_BASE}.id`,
                `${MetaTable.GROUP_BASE}.idGroup`,
                `${MetaTable.GROUP_BASE}.idBase`,
                `${MetaTable.GROUP_BASE}.created_at`,
                `${MetaTable.GROUP_BASE}.updated_at`,
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

        if (!org) NcError.badRequest('GroupBase not found');

        return await ncMeta.metaDelete(null, null, MetaTable.GROUP_BASE, id);
    }


    public static async update(id, org: Partial<GroupBase>, ncMeta = Noco.ncMeta) {
        const updateObj = extractProps(org, [
            'idGroup',
            'idBase'
        ]);
        const existingGroupBase = await this.get(id, ncMeta);
        // set meta
        return await ncMeta.metaUpdate(null, null, MetaTable.GROUP_BASE, updateObj, id);
    }


    public static async getGroupBasesCount(
        {
            query,
        }: {
            query?: string;
        },
        ncMeta = Noco.ncMeta,
    ): Promise<number> {
        const queryBuilder = ncMeta.knex(MetaTable.GROUP_BASE);

        // if (query) {
        //     queryBuilder.where('name', `%${query.toLowerCase?.()}%`);
        // }

        return (await queryBuilder.count('id', { as: 'count' }).first()).count;
    }
}