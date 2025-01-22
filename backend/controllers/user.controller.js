import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getProfile = async(req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username});

        if(!user) {
            return res.status(400).json({error: "User not found"});
        }

        res.status(200).json(user);
    } catch (error) {
        console.log(`Error in get User Profile controller: ${error}`);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const followUnfollowUser = async(req, res) => {
    try {
        const {id} = req.params;
        const userToModify = await User.findById({_id: id});
        const currentUser = await User.findById({_id: req.user._id});

        if(id === req.user._id) {
            return res.status(400).json({error: "You cannot follow yourself"});
        }

        if(!userToModify || !currentUser) {
            return res.status(400).json({error: "User not found"});
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing) {
            //unfollow
            await User.findByIdAndUpdate ({_id: id}, {$pull: {followers: req.user._id}});
            await User.findByIdAndUpdate ({_id: req.user._id}, {$pull: {following: id}});
            res.status(200).json({message: "Unfollow successfully"});
        }
        else {
            //follow
            await User.findByIdAndUpdate ({_id: id}, {$push: {followers: req.user._id}});
            await User.findByIdAndUpdate ({_id: req.user._id}, {$push: {following: id}});
            //send notification
            const newNotification = new Notification({
                from: req.user._id, 
                to: userToModify._id, 
                type: "follow"
            });
            await newNotification.save();
            res.status(200).json({message: "Follow successfully"});
        }

    } catch (error) {
        console.log(`Error in follow and Unfollow controller: ${error}`);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const getSuggestedUsers = async(req, res) => {
    try {
        const userId = req.user._id;
        const userFollowedByMe = await User.findById({_id: userId}).select("-password");

        const users = await User.aggregate ([
            {
                $match : {
                    _id: {$ne: userId},
                }
            }, {
                $sample: {
                    size: 10
                }
            }
        ])

        const filteredUsers = users.filter((user) => !userFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);
        
    } catch (error) {
        console.log(`Error in getSuggestedUsers controller: ${error}`);
        res.status(500).json({error: "Internal Server Error"});
    }
}