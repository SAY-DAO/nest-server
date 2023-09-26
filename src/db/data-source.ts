import { DataSource, DataSourceOptions } from 'typeorm';
import { MileStoneEntity } from '../entities/milestone.entity';
import { NeedEntity } from '../entities/need.entity';
import { SignatureEntity } from '../entities/signature.entity';
import { ChildrenEntity } from '../entities/children.entity';
import { StepEntity } from '../entities/step.entity';
import { ProviderEntity } from '../entities/provider.entity';
import { PaymentEntity } from '../entities/payment.entity';
import { ReceiptEntity } from '../entities/receipt.entity';
import { NgoArrivalEntity, NgoEntity } from '../entities/ngo.entity';
import { TicketEntity } from '../entities/ticket.entity';
import { TicketContentEntity } from '../entities/ticketContent.entity';
import { StatusEntity } from '../entities/status.entity';
import { CityEntity } from '../entities/city.entity';
import { TicketViewEntity } from '../entities/ticketView.entity';
import { IpfsEntity } from '../entities/ipfs.entity';
import { ContributorEntity } from '../entities/contributor.entity';
import { ProviderJoinNeedEntity } from '../entities/provider.Join.need..entity';
import { MidjourneyEntity } from '../entities/midjourney.entity';
import { Session } from '../entities/session.entity';
import { CommentEntity } from '../entities/comment.entity';
import { VariableEntity } from '../entities/variable.entity';
import { EthereumTransaction } from '../entities/ethereum.transaction.entity';
import { EthereumAccountEntity } from '../entities/ethereum.account.entity';
import config from '../config';
import { AllUserEntity } from 'src/entities/user.entity';

export const postgresDataSourceOptions: DataSourceOptions = {
  ...config().db1,
  entities: [
    Session,
    AllUserEntity,
    CityEntity,
    StatusEntity,
    ContributorEntity,
    TicketEntity,
    TicketViewEntity,
    TicketContentEntity,
    NgoEntity,
    NgoArrivalEntity,
    PaymentEntity,
    ReceiptEntity,
    NeedEntity,
    VariableEntity,
    ProviderJoinNeedEntity,
    ProviderEntity,
    MileStoneEntity,
    StepEntity,
    SignatureEntity,
    ChildrenEntity,
    EthereumAccountEntity,
    EthereumTransaction,
    IpfsEntity,
    MidjourneyEntity,
    CommentEntity,
  ],
};

const dataSource = new DataSource(postgresDataSourceOptions);
dataSource
  .initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

export default dataSource;