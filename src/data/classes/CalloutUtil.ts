import ICallout from "@/data/interfaces/ICallout";

export interface TypeValue {
  color: string;
  fontSize: string;
}

export const communityColor = "#2acb00";
export const officialColor = "#ff0000";
export const minorColor = "#5079ff";

export default class CalloutUtil {
  public static typeData(callout: ICallout): TypeValue {
    switch (callout.type) {
      case 0:
        return { color: communityColor, fontSize: "1rem" };
      case 1:
        return { color: officialColor, fontSize: "1.3rem" };
      case 2:
        return { color: minorColor, fontSize: "0.7rem" };
      default:
        return { color: "white", fontSize: "1rem" };
    }
  }
}
