import dayJs from 'dayjs';
import * as path from 'path';
import { LessThan } from 'typeorm';

import { deleteFile } from '../../../utils/deleteFile';
import ErrorHandler from '../../../utils/ErrorHandler';

import { IUser } from '../users/interfaces';
import { AgentInfoType, IAgent } from './interfaces';
import { Agent } from './model';

const findAgentByUserId = async (userId: number) => {
  const agent: IAgent | null = await Agent.findOne({ where: { user: { id: userId } } });
  delete agent?.user;

  return agent;
};

const updateAgent = async (agentInfo: AgentInfoType, userId: number) => {
  const agent = await findAgentByUserId(userId);

  if (!agent) throw new ErrorHandler(404, `agent doesn't exists`);

  if (agent.logo_url) {
    const currentDirectory = __dirname;
    const filePath = path.resolve(currentDirectory, '../../../../../boshamlan-frontend/public/images/agents');
    deleteFile(`${filePath}/${agent.logo_url}`);
  }

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
      expiry_date: dayJs().month(3),
    });
  } else {
    agentData = Agent.create({
      name: 'agent',
      expiry_date: dayJs().month(3),
      user,
    });
  }

  await Agent.save(agentData);
};

const getExpiredAgentUserIds = async () => {
  const agents = await Agent.find({
    where: { expiry_date: LessThan(new Date()) },
  });
  const userIds = agents.map((agent) => agent.user.id);
  return userIds;
};

export { initOrUpdateAgent, findAgentByUserId, updateAgent, getExpiredAgentUserIds };
