// config/database.js
import { CosmosClient, PartitionKeyDefinitionVersion, IndexingMode, ContainerDefinition } from '@azure/cosmos';

// Cosmos DB configuration
const endpoint = process.env.CosmosDBEndpoint || "";
const databaseName = process.env.CosmosDBDatabase || "";
const containerName = process.env.CosmosDBContainer || "";

const cosmosClient = new CosmosClient(endpoint);

// Initialize Cosmos Client
async function dbConfig() {
    const { database } = await cosmosClient.databases.createIfNotExists({ id: databaseName });
    const containerDefinition: ContainerDefinition = {
        id: containerName,
        partitionKey: {
            paths: ["/userId"],
            version: PartitionKeyDefinitionVersion.V2
        },
        indexingPolicy: {
            indexingMode: IndexingMode.consistent,
            automatic: true,
            includedPaths: [
                {
                    path: "/*"
                },
                {
                    path: "/cp_index/?"
                }
            ],
            excludedPaths: [
                {
                    "path": "/\"_etag\"/?"
                }
            ]
        },
        computedProperties: [
            {
                name: "cp_index",
                query: "SELECT VALUE StringToNumber(c.id) FROM c"
            }
        ]
    }
    const { container } = await database.containers.createIfNotExists(containerDefinition);
    return container
}

export default dbConfig;