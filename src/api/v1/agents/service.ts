import dayJs from 'dayjs';

import { IUser } from '../users/interfaces';
import { Agent } from './model';

const findAgentByUserId = async (userId: number) => {
  const agent = await Agent.findOne({ where: { user: { id: userId } } });
  return agent;
};

const initOrUpdateAgent = async (user: IUser) => {
  const agent = await findAgentByUserId(user.id);

  let agentData;

  if (agent) {
    agentData = Agent.create({
      ...agent,
      expired_date: dayJs().month(3),
    });
  } else {
    agentData = Agent.create({
      name: 'agent',
      expired_date: dayJs().month(3),
      user,
    });
  }

  await Agent.save(agentData);
};

export { initOrUpdateAgent };
