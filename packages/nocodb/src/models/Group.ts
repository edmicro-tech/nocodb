import { NcError } from 'src/helpers/catchError';
import Noco from '~/Noco';
import { extractProps } from '~/helpers/extractProps';
import { CacheGetType, CacheScope, MetaTable } from '~/utils/globals';
export default class Group {
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
    idParent?: string;
    constructor(data: Group) {
        Object.assign(this, data);
    }

    protected static castType(group: Group): Group {
        return group && new Group(group);
    }

    public static async insert(
        Group: Partial<Group>,
        ncMeta = Noco.ncMeta,
    ) {
        const insertObj = extractProps(Group, [
            // 'id',
            'name',
        ]);

        const { id, name } = await ncMeta.metaInsert2(
            null,
            null,
            MetaTable.GROUP,
            insertObj,
            false,
        );
        return this.get(id, ncMeta);
    }
    public static async insertChildFolder(
        Group: Partial<Group>,
        ncMeta = Noco.ncMeta,
    ) {
        const insertObj = extractProps(Group, [
            // 'id',
            'name',
            'idParent'
        ]);
        if (!insertObj.idParent || !insertObj.name) NcError.badRequest('Request is not valid');
        const { id, name, idParent } = await ncMeta.metaInsert2(
            null,
            null,
            MetaTable.GROUP,
            insertObj,
            false,
        );
        return this.get(id, ncMeta);
    }

    static async get(id, ncMeta = Noco.ncMeta): Promise<Group> {

        let user = await ncMeta.metaGet2(null, null, MetaTable.GROUP, id);

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
        let queryBuilder = ncMeta.knex(MetaTable.GROUP);

        if (offset) queryBuilder = queryBuilder.offset(offset);

        if (limit) queryBuilder = queryBuilder.limit(limit);

        queryBuilder = queryBuilder
            .select(
                `${MetaTable.GROUP}.id`,
                `${MetaTable.GROUP}.name`,
                `${MetaTable.GROUP}.created_at`,
                `${MetaTable.GROUP}.updated_at`,
                `${MetaTable.GROUP}.idParent`,
                // `${MetaTable.GROUP_BASE}.idGroup`,
                // `${MetaTable.GROUP_BASE}.idBase`,
            );

        if (query) {
            queryBuilder.where(`${MetaTable.GROUP}.name`, 'like', `%${query.toLowerCase()}%`);
        }

        // queryBuilder = queryBuilder.leftJoin(
        //     MetaTable.GROUP_BASE,
        //     `${MetaTable.GROUP_BASE}.idGroup`,
        //     `${MetaTable.GROUP}.id`
        // );

        return queryBuilder;

    }

    static async delete(id: string, ncMeta = Noco.ncMeta) {
        if (!id) NcError.badRequest('id is required');

        const org = await this.get(id, ncMeta);

        if (!org) NcError.badRequest('Group not found');
        await ncMeta.metaDelete(null, null, MetaTable.GROUP_BASE, { idGroup: id });
        return await ncMeta.metaDelete(null, null, MetaTable.GROUP, id);
    }


    public static async update(id, org: Partial<Group>, ncMeta = Noco.ncMeta) {
        const updateObj = extractProps(org, [
            'name',
        ]);
        const existingGroup = await this.get(id, ncMeta);
        // set meta
        return await ncMeta.metaUpdate(null, null, MetaTable.GROUP, updateObj, id);
    }


    public static async getGroupsCount(
        {
            query,
        }: {
            query?: string;
        },
        ncMeta = Noco.ncMeta,
    ): Promise<number> {
        const queryBuilder = ncMeta.knex(MetaTable.GROUP);

        if (query) {
            queryBuilder.where('name', `%${query.toLowerCase?.()}%`);
        }

        return (await queryBuilder.count('id', { as: 'count' }).first()).count;
    }
}