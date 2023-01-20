import {
    NeedTypeEnum,
    PaymentStatusEnum,
    ProductStatusEnum,
    ServiceStatusEnum,
} from 'src/types/interface';
import { NeedsData } from './types/interfaces/Need';


export function getNeedsTimeLine(needsData: NeedsData, who: string) {
    let needsTimeLine: { inTwoDays: number; inWeek: number; inMonth: number; };


    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    if (who == 'createdBy') {
        const inTwoDays = needsData.needs.filter((n) => new Date(n.confirmDate).getTime() >= twoDaysAgo.getTime())
        const inWeek = needsData.needs.filter((n) => new Date(n.confirmDate).getTime() >= weekAgo.getTime())
        const inMonth = needsData.needs.filter((n) => new Date(n.confirmDate).getTime() >= monthAgo.getTime())

        needsTimeLine = { inTwoDays: inTwoDays.length, inWeek: inWeek.length, inMonth: inMonth.length }

    } else {
        const inTwoDays = needsData.needs.filter((n) => new Date(n.confirmDate).getTime() >= twoDaysAgo.getTime())
        const inWeek = needsData.needs.filter((n) => new Date(n.confirmDate).getTime() >= weekAgo.getTime())
        const inMonth = needsData.needs.filter((n) => new Date(n.confirmDate).getTime() >= monthAgo.getTime())

        needsTimeLine = { inTwoDays: inTwoDays.length, inWeek: inWeek.length, inMonth: inMonth.length }

    }


    return needsTimeLine
}

export function getOrganizedNeeds(needsData: NeedsData) {
    const organizedNeeds = [[], [], [], []]; // [[not paid], [payment], [purchased/delivered Ngo], [Done]]
    if (needsData.needs) {
        for (let i = 0; i < needsData.needs.length; i++) {
            // not Paid
            if (needsData.needs[i].status === 0) {
                organizedNeeds[0].push(needsData.needs[i]);
            }
            // Payment Received
            else if (
                needsData.needs[i].status === PaymentStatusEnum.PARTIAL_PAY ||
                needsData.needs[i].status === PaymentStatusEnum.COMPLETE_PAY
            ) {
                organizedNeeds[1].push(needsData.needs[i]);
            }

            if (needsData.needs[i].type === NeedTypeEnum.SERVICE) {
                // Payment sent to NGO
                if (needsData.needs[i].status === ServiceStatusEnum.MONEY_TO_NGO) {
                    organizedNeeds[2].push(needsData.needs[i]);
                }
                // Delivered to child
                if (needsData.needs[i].status === ServiceStatusEnum.DELIVERED) {
                    organizedNeeds[3].push(needsData.needs[i]);
                }
            } else if (needsData.needs[i].type === NeedTypeEnum.PRODUCT) {
                // Purchased
                if (needsData.needs[i].status === ProductStatusEnum.PURCHASED_PRODUCT) {
                    organizedNeeds[2].push(needsData.needs[i]);
                }
                // Delivered to Ngo
                if (needsData.needs[i].status === ProductStatusEnum.DELIVERED_TO_NGO) {
                    organizedNeeds[2].push(needsData.needs[i]);
                }
                // Delivered to child
                if (needsData.needs[i].status === ProductStatusEnum.DELIVERED) {
                    organizedNeeds[3].push(needsData.needs[i]);
                }
            }
        }
        return organizedNeeds;
    }
}