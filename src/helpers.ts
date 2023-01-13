import {
    NeedTypeEnum,
    PaymentStatusEnum,
    ProductStatusEnum,
    ServiceStatusEnum,
} from 'src/types/interface';
import { NeedsData } from './types/interfaces/Need';


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