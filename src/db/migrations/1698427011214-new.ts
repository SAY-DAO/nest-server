import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698427011214 implements MigrationInterface {
    name = 'New1698427011214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP CONSTRAINT "FK_11bdf6d719c11cfc798c99a3ec9"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ALTER COLUMN "ngoId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD CONSTRAINT "FK_11bdf6d719c11cfc798c99a3ec9" FOREIGN KEY ("ngoId") REFERENCES "ngo_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP CONSTRAINT "FK_11bdf6d719c11cfc798c99a3ec9"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ALTER COLUMN "ngoId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD CONSTRAINT "FK_11bdf6d719c11cfc798c99a3ec9" FOREIGN KEY ("ngoId") REFERENCES "ngo_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
