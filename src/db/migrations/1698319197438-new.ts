import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698319197438 implements MigrationInterface {
    name = 'New1698319197438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "state" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "state"`);
    }

}