import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698509521151 implements MigrationInterface {
    name = 'New1698509521151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ALTER COLUMN "sex" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ALTER COLUMN "sex" DROP NOT NULL`);
    }

}
