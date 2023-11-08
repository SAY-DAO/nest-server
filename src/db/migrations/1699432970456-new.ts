import { MigrationInterface, QueryRunner } from "typeorm";

export class New1699432970456 implements MigrationInterface {
    name = 'New1699432970456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "campaign_entity_content_signatures_signature_entity" ("campaignEntityId" uuid NOT NULL, "signatureEntityId" uuid NOT NULL, CONSTRAINT "PK_2a6739114fed6e9d81369e83453" PRIMARY KEY ("campaignEntityId", "signatureEntityId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_edca9c9d4686a3cb99d20ae497" ON "campaign_entity_content_signatures_signature_entity" ("campaignEntityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e34cd832c86a0366db8a8b9d06" ON "campaign_entity_content_signatures_signature_entity" ("signatureEntityId") `);
        await queryRunner.query(`CREATE TABLE "campaign_entity_content_needs_need_entity" ("campaignEntityId" uuid NOT NULL, "needEntityId" uuid NOT NULL, CONSTRAINT "PK_98884604dc03c841798c07824a0" PRIMARY KEY ("campaignEntityId", "needEntityId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_65b8cbeda0c8f14d9a97500a1b" ON "campaign_entity_content_needs_need_entity" ("campaignEntityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0863220483cce26ae11a4e9f88" ON "campaign_entity_content_needs_need_entity" ("needEntityId") `);
        await queryRunner.query(`ALTER TABLE "campaign_entity_content_signatures_signature_entity" ADD CONSTRAINT "FK_edca9c9d4686a3cb99d20ae4978" FOREIGN KEY ("campaignEntityId") REFERENCES "campaign_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "campaign_entity_content_signatures_signature_entity" ADD CONSTRAINT "FK_e34cd832c86a0366db8a8b9d06c" FOREIGN KEY ("signatureEntityId") REFERENCES "signature_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaign_entity_content_needs_need_entity" ADD CONSTRAINT "FK_65b8cbeda0c8f14d9a97500a1ba" FOREIGN KEY ("campaignEntityId") REFERENCES "campaign_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "campaign_entity_content_needs_need_entity" ADD CONSTRAINT "FK_0863220483cce26ae11a4e9f88d" FOREIGN KEY ("needEntityId") REFERENCES "need_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_entity_content_needs_need_entity" DROP CONSTRAINT "FK_0863220483cce26ae11a4e9f88d"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity_content_needs_need_entity" DROP CONSTRAINT "FK_65b8cbeda0c8f14d9a97500a1ba"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity_content_signatures_signature_entity" DROP CONSTRAINT "FK_e34cd832c86a0366db8a8b9d06c"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity_content_signatures_signature_entity" DROP CONSTRAINT "FK_edca9c9d4686a3cb99d20ae4978"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0863220483cce26ae11a4e9f88"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65b8cbeda0c8f14d9a97500a1b"`);
        await queryRunner.query(`DROP TABLE "campaign_entity_content_needs_need_entity"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e34cd832c86a0366db8a8b9d06"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_edca9c9d4686a3cb99d20ae497"`);
        await queryRunner.query(`DROP TABLE "campaign_entity_content_signatures_signature_entity"`);
    }

}
