import ICallout from "@/data/interfaces/ICallout";

export default interface IMapData {
  id: string;
  name: string;
  minimap: string;
  loadingScreen: string;
  callouts: ICallout[];
}
