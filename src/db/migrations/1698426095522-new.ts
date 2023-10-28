import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698426095522 implements MigrationInterface {
    name = 'New1698426095522'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "socialWorkerId" uuid`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "ngoId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD CONSTRAINT "FK_61094282a2c5eca786880ba1c86" FOREIGN KEY ("socialWorkerId") REFERENCES "contributor_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD CONSTRAINT "FK_11bdf6d719c11cfc798c99a3ec9" FOREIGN KEY ("ngoId") REFERENCES "ngo_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP CONSTRAINT "FK_11bdf6d719c11cfc798c99a3ec9"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP CONSTRAINT "FK_61094282a2c5eca786880ba1c86"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "ngoId"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "socialWorkerId"`);
    }

}
