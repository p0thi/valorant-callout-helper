import ICallout from "@/data/interfaces/ICallout";

export interface TypeValue {
  color: string;
  fontColor?: string;
  fontSize: string;
}

export const communityColor = "#65ff41";
export const officialColor = "#ff960c";
export const minorColor = "#7594ff";

export default class CalloutUtil {
  public static typeData(callout: ICallout): TypeValue {
    switch (callout.type) {
      case 0:
        return { color: communityColor, fontColor: "black", fontSize: "1em" };
      case 1:
        return { color: officialColor, fontColor: "black", fontSize: "1.3em" };
      case 2:
        return { color: minorColor, fontColor: "black", fontSize: "0.7em" };
      default:
        return { color: "white", fontColor: "black", fontSize: "1em" };
    }
  }
}
