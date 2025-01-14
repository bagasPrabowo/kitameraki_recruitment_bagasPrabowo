import dbConfig from '../config/database';

async function getNextId(userId: string) {
    const container = await dbConfig();
    const { resources: result } = await container.items
        .query("SELECT TOP 1 c.cp_index FROM c ORDER BY c.cp_index DESC", { partitionKey: userId })
        .fetchAll();

    if (result.length > 0) {
        return (result[0].cp_index + 1).toString()
    } else {
        return '1'
    }
}

export default getNextId 