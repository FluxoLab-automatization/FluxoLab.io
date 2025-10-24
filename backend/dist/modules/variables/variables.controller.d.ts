import { VariablesService } from './variables.service';
import { CreateVariableDto, UpdateVariableDto, CreateWorkspaceVariableDto, UpdateWorkspaceVariableDto } from './dto/variables.dto';
export declare class VariablesController {
    private readonly variablesService;
    constructor(variablesService: VariablesService);
    createGlobalVariable(createVariableDto: CreateVariableDto, user: any): Promise<any>;
    getGlobalVariables(): Promise<any[]>;
    getGlobalVariableById(id: string): Promise<any>;
    updateGlobalVariable(id: string, updateVariableDto: UpdateVariableDto, user: any): Promise<any>;
    deleteGlobalVariable(id: string): Promise<{
        message: string;
    }>;
    createWorkspaceVariable(createVariableDto: CreateWorkspaceVariableDto, user: any, req: any): Promise<any>;
    getWorkspaceVariables(req: any): Promise<any[]>;
    getWorkspaceVariableById(id: string, req: any): Promise<any>;
    updateWorkspaceVariable(id: string, updateVariableDto: UpdateWorkspaceVariableDto, user: any, req: any): Promise<any>;
    deleteWorkspaceVariable(id: string, req: any): Promise<{
        message: string;
    }>;
    getVariableByName(name: string, req: any): Promise<any>;
}
