import dayJs from 'dayjs';
import ErrorHandler from '../../../utils/ErrorHandler';

import { IUser } from '../users/interfaces';
import { AgentInfoType } from './interfaces';
import { Agent } from './model';

const findAgentByUserId = async (userId: number) => {
  const agent = await Agent.findOne({ where: { user: { id: userId } } });
  return agent;
};

const updateAgent = async (agentInfo: AgentInfoType, userId: number) => {
  const agent = await findAgentByUserId(userId);

  if (!agent) throw new ErrorHandler(404, `agent doesn't exists`);

  const agentData = Agent.create({
    ...agent,
    ...agentInfo,
  });

  await Agent.save(agentData);
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

export { initOrUpdateAgent, findAgentByUserId, updateAgent };
