import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698342765709 implements MigrationInterface {
    name = 'New1698342765709'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ngo_entity" DROP CONSTRAINT "FK_6520ff2eb387b2f379807458cf1"`);
        await queryRunner.query(`ALTER TABLE "ngo_entity" RENAME COLUMN "cityId" TO "cityObjectId"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "cityObjectId" uuid`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD CONSTRAINT "FK_779dbfb6fb908ee9f9d3714e2cb" FOREIGN KEY ("cityObjectId") REFERENCES "city_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ngo_entity" ADD CONSTRAINT "FK_bbd381806e2ff04a8ff95f72a88" FOREIGN KEY ("cityObjectId") REFERENCES "city_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ngo_entity" DROP CONSTRAINT "FK_bbd381806e2ff04a8ff95f72a88"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP CONSTRAINT "FK_779dbfb6fb908ee9f9d3714e2cb"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "cityObjectId"`);
        await queryRunner.query(`ALTER TABLE "ngo_entity" RENAME COLUMN "cityObjectId" TO "cityId"`);
        await queryRunner.query(`ALTER TABLE "ngo_entity" ADD CONSTRAINT "FK_6520ff2eb387b2f379807458cf1" FOREIGN KEY ("cityId") REFERENCES "city_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
