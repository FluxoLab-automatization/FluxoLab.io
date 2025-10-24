import { DatabaseService } from '../../shared/database/database.service';
import { CreateVariableDto, UpdateVariableDto, CreateWorkspaceVariableDto, UpdateWorkspaceVariableDto } from './dto/variables.dto';
export declare class VariablesService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    createGlobalVariable(createVariableDto: CreateVariableDto, userId: string): Promise<any>;
    getGlobalVariables(): Promise<any[]>;
    getGlobalVariableById(id: string): Promise<any>;
    updateGlobalVariable(id: string, updateVariableDto: UpdateVariableDto, userId: string): Promise<any>;
    deleteGlobalVariable(id: string): Promise<{
        message: string;
    }>;
    createWorkspaceVariable(workspaceId: string, createVariableDto: CreateWorkspaceVariableDto, userId: string): Promise<any>;
    getWorkspaceVariables(workspaceId: string): Promise<any[]>;
    getWorkspaceVariableById(workspaceId: string, id: string): Promise<any>;
    updateWorkspaceVariable(workspaceId: string, id: string, updateVariableDto: UpdateWorkspaceVariableDto, userId: string): Promise<any>;
    deleteWorkspaceVariable(workspaceId: string, id: string): Promise<{
        message: string;
    }>;
    getVariableByName(workspaceId: string, name: string): Promise<any>;
}
