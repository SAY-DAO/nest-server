import { MigrationInterface, QueryRunner } from "typeorm";

export class New1699105112698 implements MigrationInterface {
    name = 'New1699105112698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "campaign_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying NOT NULL, "campaign" integer NOT NULL, "type" integer NOT NULL, CONSTRAINT "PK_9e02b1f09bf92b8ce7b80e4fb7a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "campaign_entity_receivers_all_user_entity" ("campaignEntityId" uuid NOT NULL, "allUserEntityId" uuid NOT NULL, CONSTRAINT "PK_147af3299a0c9fe8859ce754aa0" PRIMARY KEY ("campaignEntityId", "allUserEntityId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c7f9a0ab87070fb14e116587a8" ON "campaign_entity_receivers_all_user_entity" ("campaignEntityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_47beff96e36228ba71b277e509" ON "campaign_entity_receivers_all_user_entity" ("allUserEntityId") `);
        await queryRunner.query(`CREATE TABLE "campaign_entity_content_signatures_signature_entity" ("campaignEntityId" uuid NOT NULL, "signatureEntityId" uuid NOT NULL, CONSTRAINT "PK_2a6739114fed6e9d81369e83453" PRIMARY KEY ("campaignEntityId", "signatureEntityId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_edca9c9d4686a3cb99d20ae497" ON "campaign_entity_content_signatures_signature_entity" ("campaignEntityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e34cd832c86a0366db8a8b9d06" ON "campaign_entity_content_signatures_signature_entity" ("signatureEntityId") `);
        await queryRunner.query(`CREATE TABLE "campaign_entity_content_needs_need_entity" ("campaignEntityId" uuid NOT NULL, "needEntityId" uuid NOT NULL, CONSTRAINT "PK_98884604dc03c841798c07824a0" PRIMARY KEY ("campaignEntityId", "needEntityId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_65b8cbeda0c8f14d9a97500a1b" ON "campaign_entity_content_needs_need_entity" ("campaignEntityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0863220483cce26ae11a4e9f88" ON "campaign_entity_content_needs_need_entity" ("needEntityId") `);
        await queryRunner.query(`ALTER TABLE "campaign_entity_receivers_all_user_entity" ADD CONSTRAINT "FK_c7f9a0ab87070fb14e116587a8d" FOREIGN KEY ("campaignEntityId") REFERENCES "campaign_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "campaign_entity_receivers_all_user_entity" ADD CONSTRAINT "FK_47beff96e36228ba71b277e509b" FOREIGN KEY ("allUserEntityId") REFERENCES "all_user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
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
        await queryRunner.query(`ALTER TABLE "campaign_entity_receivers_all_user_entity" DROP CONSTRAINT "FK_47beff96e36228ba71b277e509b"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity_receivers_all_user_entity" DROP CONSTRAINT "FK_c7f9a0ab87070fb14e116587a8d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0863220483cce26ae11a4e9f88"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65b8cbeda0c8f14d9a97500a1b"`);
        await queryRunner.query(`DROP TABLE "campaign_entity_content_needs_need_entity"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e34cd832c86a0366db8a8b9d06"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_edca9c9d4686a3cb99d20ae497"`);
        await queryRunner.query(`DROP TABLE "campaign_entity_content_signatures_signature_entity"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_47beff96e36228ba71b277e509"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c7f9a0ab87070fb14e116587a8"`);
        await queryRunner.query(`DROP TABLE "campaign_entity_receivers_all_user_entity"`);
        await queryRunner.query(`DROP TABLE "campaign_entity"`);
    }

}
