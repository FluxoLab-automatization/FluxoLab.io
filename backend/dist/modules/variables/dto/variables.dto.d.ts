export declare class CreateVariableDto {
    name: string;
    description?: string;
    value: string;
    type?: string;
    is_encrypted?: boolean;
}
export declare class UpdateVariableDto {
    description?: string;
    value?: string;
    type?: string;
    is_encrypted?: boolean;
}
export declare class CreateWorkspaceVariableDto extends CreateVariableDto {
}
export declare class UpdateWorkspaceVariableDto extends UpdateVariableDto {
}
