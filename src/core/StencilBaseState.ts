export interface StencilBaseState {
  typeName: string;
  iid: number;
  notes?: string;

  left: number;
  top: number;
  width: number;
  height: number;

  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  strokeDasharray: string;
}